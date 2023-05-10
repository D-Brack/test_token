//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Token {
    address public owner;

    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance; //owner => (spender => remaining amount)

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(string memory _name, string memory _symbol, uint8 _decimals, uint256 _totalSupply) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = _totalSupply * (10 ** decimals);

        owner = msg.sender;
        balanceOf[owner] = totalSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        _transfer(msg.sender, _to, _value);

        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(allowance[_from][msg.sender] >= _value, 'Insufficient allowance');
        require(_validAddress(_from, bytes('token owner')));

        _transfer(_from, _to, _value);
        allowance[_from][msg.sender] -= _value;

        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        require(_validAddress(_spender, bytes('spender')), 'Invalid spender address.');
        allowance[msg.sender][_spender] += _value;

        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function _transfer(address _from, address _to, uint256 _value) internal returns (bool success) {
        require(balanceOf[_from] >= _value, 'Insufficient balance.');
        require(_validAddress(_to, bytes('token recipient')));

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(_from, _to, _value);
        return true;
    }

    function _validAddress(address _toCheck, bytes memory keyWords) internal pure returns (bool valid) {
        require(_toCheck != address(0), string(bytes.concat('Invalid ', keyWords, ' address')));

        return true;
    }
}
