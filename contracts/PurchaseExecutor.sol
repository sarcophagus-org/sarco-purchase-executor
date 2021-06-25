// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/GeneralTokenVesting.sol";

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
        uint256 usdc_cost
    );

    // Creates a window of time which the whitelisted set of addresses may purchase SARCO
    event OfferStarted(
        // Window start time
        uint256 started_at,
        // Window end time
        uint256 expires_at
    );

    // Recover Tokens
    event TokensRecovered(
        // Amount of Tokens
        uint256 amount
    );

    uint256 public constant USDC_TO_SARCO_RATE_PRECISION = 10**18;

    address public SARCO_DAO;

    // how much SARCO in one USDC, USDC_TO_SARCO_RATE_PERCISION being 1
    uint256 public usdc_to_sarco_rate;
    uint256 public sarco_allocations_total;
    mapping(address => uint256) public sarco_allocations;

    // Timing in seconds
    uint256 public offer_expiration_delay;
    uint256 public offer_started_at;
    uint256 public offer_expires_at;
    uint256 public vesting_end_delay;

    /**
     * @dev inits/sets sarco purchase enviorment
     * @param _usdc_to_sarco_rate How much SARCO one gets for one USDC (multiplied by 10**18)
     * @param _vesting_end_delay Delay from the purchase moment to the vesting end moment, in seconds
     * @param _offer_expiration_delay Delay from the contract deployment to offer expiration, in seconds
     * @param _sarco_purchasers  List of valid SARCO purchasers, padded by zeroes to the length of 50
     * @param _sarco_allocations List of SARCO token allocations, padded by zeroes to the length of 50
     * @param _sarco_allocations_total Checksum of SARCO token allocations
     */
    function initialize(
        uint256 _usdc_to_sarco_rate,
        uint256 _vesting_end_delay,
        uint256 _offer_expiration_delay,
        address[] memory _sarco_purchasers,
        uint256[] memory _sarco_allocations,
        uint256 _sarco_allocations_total,
        address _sarco_dao
    ) external {
        require(
            _usdc_to_sarco_rate > 0,
            "PurchaseExecutor: rate must be greater than 0"
        );
        require(
            _vesting_end_delay > 0,
            "PurchaseExecutor: end_delay must happen in the future"
        );
        require(
            _offer_expiration_delay > 0,
            "PurchaseExecutor: offer_expiration must be greater than 0"
        );
        require(
            _sarco_purchasers.length == _sarco_allocations.length,
            "PurchaseExecutor: purchasers and allocations lengths must be equal"
        );

        // Set global variables
        usdc_to_sarco_rate = _usdc_to_sarco_rate;
        vesting_end_delay = _vesting_end_delay;
        offer_expiration_delay = _offer_expiration_delay;
        sarco_allocations_total = _sarco_allocations_total;
        SARCO_DAO = _sarco_dao;

        uint256 allocations_sum = 0;

        for (uint256 i = 0; i < _sarco_purchasers.length; i++) {
            address purchaser = _sarco_purchasers[i];
            if (purchaser == address(0)) {
                break;
            }
            require(
                sarco_allocations[purchaser] == 0,
                "PurchaseExecutor: Allocation has already been set"
            );
            uint256 allocation = _sarco_allocations[i];
            require(
                allocation > 0,
                "PurchaseExecutor: No allocated Sarco tokens for address"
            );
            sarco_allocations[purchaser] = allocation;
            allocations_sum += allocation;
        }
        require(
            allocations_sum == _sarco_allocations_total,
            "PurchaseExecutor: Allocations_total does not equal the sum of passed allocations"
        );
    }

    //should this be public - msg.sender can only check
    function _get_allocation(address _sarco_receiver)
        internal
        view
        returns (uint256, uint256)
    {
        uint256 sarco_allocation = sarco_allocations[_sarco_receiver];
        uint256 usdc_cost = (sarco_allocation * USDC_TO_SARCO_RATE_PRECISION) /
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
            require(
                IERC20(token).balanceOf(address(this)) ==
                    sarco_allocations_total,
                "PurchaseExecutor: not funded with Sarco Tokens"
            );
            uint256 started_at = block.timestamp;
            uint256 expires_at = started_at + offer_expiration_delay;
            offer_started_at = started_at;
            offer_expires_at = expires_at;
            emit OfferStarted(started_at, expires_at);
        }
    }

    /**
     * @notice Starts the offer if it 1) hasn't been started yet and 2) has received funding in full.
     */
    function start(IERC20 token) external {
        _start_unless_started(token);
    }

    /**
     * @return A tuple: the first element is the amount of SARCO available for purchase (zero if
        the purchase was already executed for that address), the second element is the
        USDC cost of the purchase.
     */
    function get_allocation() external view returns (uint256, uint256) {
        return _get_allocation(msg.sender);
    }

    function _execute_purchase(
        address _sarco_receiver,
        IERC20 usdc_token,
        IERC20 sarco_token,
        address general_token_vesting_address
    ) internal {
        _start_unless_started(sarco_token);
        require(block.timestamp < offer_expires_at, "PurchaseExecutor: offer expired");

        uint256 sarco_allocation = 0;
        uint256 usdc_cost = 0;
        (sarco_allocation, usdc_cost) = _get_allocation(_sarco_receiver);

        // check allocation
        require(sarco_allocation > 0, "PurchaseExecutor: you have no Sarco allocation");

        // forward USDC cost of the purchase to the DAO contract
        uint256 before_Balance = usdc_token.balanceOf(SARCO_DAO);
        usdc_token.safeTransferFrom(msg.sender, SARCO_DAO, usdc_cost);
        uint256 after_balance = usdc_token.balanceOf(SARCO_DAO);

        // check if usdc recieved covers usdc cost
        uint256 _usdc_received = after_balance - before_Balance;
        require(_usdc_received >= usdc_cost, "PurchaseExecutor: insufficent USDC to make Sarco Purchase");

        // clear purchaser allocation
        sarco_allocations[_sarco_receiver] = 0;

        //approve tokens to general vesting contract...
        // will need to just approve and call deposit
        IERC20(sarco_token).approve(
            general_token_vesting_address,
            sarco_allocation
        );

        // if it returns a vesting_id
        // must include tokenvesting contract address + vesting_end_delay
        GeneralTokenVesting(general_token_vesting_address).startVest(
            _sarco_receiver,
            sarco_allocation,
            vesting_end_delay,
            sarco_token
        );

        emit PurchaseExecuted(_sarco_receiver, sarco_allocation, usdc_cost);
    }

    /**
     * @dev Purchases Sarco for the specified address (defaults to message sender) in exchange for USDC.
     */

    function execute_purchase(
        IERC20 usdc_token,
        IERC20 sarco_token,
        address general_token_vesting_address
    ) external {
        _execute_purchase(
            msg.sender,
            usdc_token,
            sarco_token,
            general_token_vesting_address
        );
    }

    function recover_unsold_tokens(IERC20 token) external {
        require(offer_started_at != 0, "PurchaseExecutor: Purchase offer has not started");
        require(
            block.timestamp >= offer_expires_at,
            "PurchaseExecutor: Purchase offer has not yet expired"
        );
        uint256 unsold_sarco_amount = IERC20(token).balanceOf(address(this));
        if (unsold_sarco_amount > 0) {
            IERC20(token).safeTransfer(SARCO_DAO, unsold_sarco_amount);
            emit TokensRecovered(unsold_sarco_amount);
        }
    }
}
