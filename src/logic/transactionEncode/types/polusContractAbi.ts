export const PolusContractAbi = [
  `function DoERC20Payment(
        bytes16 uuid,
        address token,
        address feerecvr,
        uint256 feevalue,
        address mrhrecvr,
        uint256 mrhvalue
)`,
  `function DoETHPayment(
        bytes16 uuid,
        address feerecvr,
        uint256 feevalue,
        address mrhrecvr,
        uint256 mrhvalue
)`,
];

export const PolusContractAddress = {
  1: "0x2bd0a4277B94B3dA535419712433e135FA9273C1",
  56: "0x2bd0a4277B94B3dA535419712433e135FA9273C1",
  137: "0x8323516F3d02288cDF0cbBf2794d55671666C4BA",
};
