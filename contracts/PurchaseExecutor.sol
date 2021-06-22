// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title PurchaseExecutor
 * @dev allow a whitelisted set of addresses to purchase SARCO tokens, for stablecoins (USDC), at a set rate
 */
contract PurchaseExecutor {
    using SafeERC20 for IERC20;

    // The purchase has been executed exchanging USDC to vested SARCO
    event PurchaseExecuted(
        // the address that has received the vested SARCO tokens
        address indexed sarco_receiver,
        // the number of SARCO tokens vested to sarco_receiver
        uint256 sarco_allocation,
        // the amount of USDC that was paid and forwarded to the DAO
        uint256 usdc_cost,
        // the vesting id to be used with the General Vesting Token contract
        uint256 vesting_id
    );

    // Creates a window of time which the whitelisted set of addresses may purchase SARCO
    event OfferStarted(
        // Window start time
        uint256 started_at,
        // Window end time
        uint256 expires_at
    );

    // What are the total Max_purchasers
    uint256 constant public MAX_PURCHASERS = 3;
    uint256 constant public USDC_TO_SARCO_RATE_PRECISION = 10**18;

    address constant public SARCO_TOKEN = 0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32;
    address constant public SARCO_DAO = 0xf73a1260d222f447210581DDf212D915c09a3249;
    address constant public GENERAL_VESTING_CONTRACT =
        0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c;

    // how much SARCO in one USDC, USDC_TO_SARCO_RATE_PERCISION being 1
    uint256 public usdc_to_sarco_rate;
    uint256 public sarco_allocations_total;
    mapping(address => uint256) public sarco_allocations;

    // Timing in seconds
    uint256 public offer_expiration_delay;
    uint256 public offer_started_at;
    uint256 public offer_expires_at;
    uint256 public vesting_start_delay;
    uint256 public vesting_end_delay;

    /**
     * @dev inits/sets sarco purchase enviorment
     * @param _usdc_to_sarco_rate How much SARCO one gets for one USDC (multiplied by 10**18)
     * @param _vesting_start_delay Delay from the purchase moment to the vesting start moment, in seconds
     * @param _vesting_end_delay Delay from the purchase moment to the vesting end moment, in seconds
     * @param _offer_expiration_delay Delay from the contract deployment to offer expiration, in seconds
     * @param _sarco_purchasers  List of valid SARCO purchasers, padded by zeroes to the length of 50
     * @param _sarco_allocations List of SARCO token allocations, padded by zeroes to the length of 50
     * @param _sarco_allocations_total Checksum of SARCO token allocations
     */
    function initialize(
        uint256 _usdc_to_sarco_rate,
        uint256 _vesting_start_delay,
        uint256 _vesting_end_delay,
        uint256 _offer_expiration_delay,
        address[] memory _sarco_purchasers,
        uint256[] memory _sarco_allocations,
        uint256 _sarco_allocations_total
    ) external {
        require(_usdc_to_sarco_rate > 0, "PurchaseExecutor: rate must be greater than 0");
        require(_vesting_end_delay >= _vesting_start_delay, "PurchaseExecutor: end_delay must be greater than or equal to start_delay");
        require(_offer_expiration_delay > 0, "PurchaseExecutor: offer_expiration must be greater than 0");

        // Set global variables
        usdc_to_sarco_rate = _usdc_to_sarco_rate;
        vesting_start_delay = _vesting_start_delay;
        vesting_end_delay = _vesting_end_delay;
        offer_expiration_delay = _offer_expiration_delay;
        sarco_allocations_total = _sarco_allocations_total;

        uint256 allocations_sum = 0;

        for (uint i = 0; i < MAX_PURCHASERS; i++) {
            address purchaser = _sarco_purchasers[i];
            if (purchaser == 0x0000000000000000000000000000000000000000) {
                break;
            }
            require(sarco_allocations[purchaser] == 0, "PurchaseExecutor: Allocation has already been set");
            uint256 allocation = _sarco_allocations[i];
            require(allocation > 0, "PurchaseExecutor: No allocated Sarco tokens for address");
            sarco_allocations[purchaser] = allocation;
            allocations_sum += allocation;
        }
        require(allocations_sum == _sarco_allocations_total, "PurchaseExecutor: Allocations_total does not equal the sum of passed allocations");
    }

    //should this be public - msg.sender can only check
    function _get_allocation(address _sarco_receiver)
        internal
        view
        returns (uint256, uint256)
    {
        uint256 sarco_allocation = sarco_allocations[_sarco_receiver];
        uint256 usdc_cost =
            (sarco_allocation * USDC_TO_SARCO_RATE_PRECISION) /
                usdc_to_sarco_rate;
        return (sarco_allocation, usdc_cost);
    }

    function offer_started() external view returns (bool) {
        return offer_started_at != 0;
    }

    function offer_expired() external view returns (bool) {
        return block.timestamp >= offer_expires_at;
    }

    //should be sarco token - extra param
    function _start_unless_started(IERC20 token) internal {
        if (offer_started_at == 0) {
            // Should be sarco/token
            require(IERC20(token).balanceOf(address(this)) == sarco_allocations_total, "not funded");
            uint256 started_at = block.timestamp;
            uint256 expires_at = started_at + offer_expiration_delay;
            offer_started_at = started_at;
            offer_expires_at = expires_at;
            emit OfferStarted (started_at, expires_at);
        }
    }

    /**
     * @notice Starts the offer if it 1) hasn't been started yet and 2) has received funding in full.
     */
    function start(IERC20 token) external {
        _start_unless_started(token);
    }
}
