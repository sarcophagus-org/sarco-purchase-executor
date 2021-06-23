// SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

pragma solidity ^0.8.4;

interface GeneralTokenVesting {
    function startVest(address beneficiary, uint256 tokensToVest, uint256 vestDuration, IERC20 tokenAddress) external;

}