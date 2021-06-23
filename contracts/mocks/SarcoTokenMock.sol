// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SarcoTokenMock is ERC20 {
    constructor() ERC20("Sarco", "SCO") {}

    function mint(address to_, uint256 amount_) public {
        _mint(to_, amount_);
    }

    function burn(address from_, uint256 amount_) public virtual {
        _burn(from_, amount_);
    }
}
