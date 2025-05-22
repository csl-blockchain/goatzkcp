#!/bin/bash

set -e

source ../../config.sh
source ../common/print.sh
source ../common/wallet.sh

contract_address=$(cat ../contract/out/deploy.txt)

prelude() {
    echo -e "${BLUE}Transact with an encrypted contract in <1m.${NC}"
    echo -e "It'll increment by 3, try to read it, but get back ??? because 3 < 5."
    echo -e "Then it'll increment by 2, try to read it, and succeed because 5 >= 5."
    echo -ne "Press Enter to continue..."
    read -r
}

address=0x53198B615Ec2F9D8d04520F52600c36c0F0c9A10
privkey=0xcece1d0c98a9c8ef1275abce69585440cbc64004f4b8aeeecc5f2a89e3cad1e0

bun run src/index.ts $RPC_URL $EXPLORER_URL $contract_address $privkey
