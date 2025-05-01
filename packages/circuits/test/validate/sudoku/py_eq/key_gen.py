import json

nPairs = 1003
keys = list(range(1, nPairs * 2 + 4))   # 2009 keys: [1, 2, ..., 2009]
pt = [1] * (nPairs * 2)                 # 2006 PTs: all ones

data = {
    "Keys": keys,
    "PT": pt
}

with open("input_1003.json", "w") as f:
    json.dump(data, f, indent=2)

print("✅ input_1003.json generated.")