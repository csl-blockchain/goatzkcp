Run the Local Network
```
sanvil
```

Compile the Smart Contracts
```
sforge build
```

Run the Tests (if exists)
```
sforge test
```

Deploying GoatZKCPFactory
```
❯ sforge script script/GoatZKCPFactory.s.sol:GoatZKCPFactoryScript \
      --rpc-url $RPC_URL \
      --broadcast
```

Deploying GoatZKCPJudge
```
❯ sforge script script/GoatZKCPJudge.s.sol:GoatZKCPJudgeScript \    
      --rpc-url $RPC_URL \
      --broadcast
```

Deploying Lock
```
❯ sforge script script/Lock.s.sol:LockScript \                      
      --rpc-url $RPC_URL \
      --broadcast
```