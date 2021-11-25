// SPDX-License-Identifier: MIT
pragma solidity ^0.6.2;

import "./Ownable.sol";

contract Votable is Ownable{

    // voter->bool
    mapping(address => bool) public voters;

    // voters count
    uint16 public votersCount = 0;

    // pid->proposal
    mapping(uint16 => Proposal) public proposals;

    // next pid, start with 10000
    uint16 public nextPid = 10000;

    constructor() internal{
        // init owner as a voter
        voters[owner()] = true;
        votersCount++;
        emit AddVoter(owner());
    }

    // struct of proposal
    struct Proposal {
        uint16 pid;
        uint16 count;
        bool done;
        bytes payload;
        // voter->bool
        mapping(address => bool) votes;
    }

    // events
    event OpenProposal(uint16 pid);

    event CloseProposal(uint16 pid);

    event DoneProposal(uint16 pid);

    event VoteProposal(uint16 pid, address voter);

    event AddVoter(address voter);

    event RemoveVoter(address voter);

    // modifiers
    modifier proposalExistAndNotDone(uint16 _pid){
        require(proposals[_pid].pid == _pid, "Votable: proposal not exists");
        require(!proposals[_pid].done, "Votable: proposal is done");
        _;
    }

    modifier onlyVoters(){
        require(voters[_msgSender()], "Votable: only voter can call");
        _;
    }

    modifier onlySelf(){
        require(_msgSender() == address(this), "Votable: only self can call");
        _;
    }

    // for inheriting
    function _openProposal(bytes memory payload) internal{
        uint16 pid = nextPid++;
        proposals[pid] = Proposal(pid,0,false,payload);
        emit OpenProposal(pid);
    }

    // vote
    function voteProposal(uint16 _pid) public onlyVoters proposalExistAndNotDone(_pid){
        Proposal storage proposal = proposals[_pid];
        require(!proposal.votes[_msgSender()], "Votable: duplicate voting is not allowed");

        proposal.votes[_msgSender()] = true;
        proposal.count++;
        emit VoteProposal(_pid, _msgSender());

        // judge
        _judge(proposal);
    }

    function _judge(Proposal storage _proposal) private{
        if(_proposal.count > votersCount/2){
            (bool success, ) = address(this).call(_proposal.payload);
            require(success, "Votable: call payload failed");
            _proposal.done = true;
            emit DoneProposal(_proposal.pid);
        }
    }

    // hasVoted
    function hasVoted(uint16 _pid) public view returns(bool){
        Proposal storage proposal = proposals[_pid];
        require(proposal.pid == _pid, "Votable: proposal not exists");
        return proposal.votes[_msgSender()];
    }

    // translate proposal
    // function translateProposal(uint16 _pid) external view returns(bytes32, address, uint256){
    //     Proposal memory proposal = proposals[_pid];
    //     require(proposal.pid == _pid, "Votable: proposal not exists");
    //     return abi.decode(abi.encodePacked(bytes28(0), proposal.payload),(bytes32,address,uint256));
    // }

    // onlySelf: match to proposals
    function addVoter(address _voter) external onlySelf{
        require(!voters[_voter], "Votable: this address is already a voter");
        voters[_voter] = true;
        votersCount++;
        emit AddVoter(_voter);
    }

    function removeVoter(address _voter) external onlySelf{
        require(voters[_voter], "Votable: this address is not a voter");
        require(_voter != owner(), "Votable: owner can not be removed");
        voters[_voter] = false;
        votersCount--;
        emit RemoveVoter(_voter);
    }

    // onlyOwner
    // open proposals
    function openAddVoterProposal(address _voter) external onlyOwner{
        _openProposal(abi.encodeWithSignature("addVoter(address)",_voter));
    }

    function openRemoveVoterProposal(address _voter) external onlyOwner{
        _openProposal(abi.encodeWithSignature("removeVoter(address)",_voter));
    }

    // close proposal
    function closeProposal(uint16 _pid) external proposalExistAndNotDone(_pid) onlyOwner{
        proposals[_pid].done = true;
        emit CloseProposal(_pid);
    }

}