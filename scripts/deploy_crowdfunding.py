import os, base64, time
from algosdk import account, mnemonic
from algosdk.v2client import algod
from algosdk.transaction import *
from dotenv import load_dotenv

load_dotenv()

client = algod.AlgodClient(
    os.getenv("ALGOD_TOKEN"),
    os.getenv("ALGOD_ADDRESS")
)

private_key = mnemonic.to_private_key(os.getenv("MNEMONIC"))
address = account.address_from_private_key(private_key)

with open("approval.teal") as f:
    approval = f.read()

with open("clear.teal") as f:
    clear = f.read()

approval_bin = base64.b64decode(client.compile(approval)["result"])
clear_bin = base64.b64decode(client.compile(clear)["result"])

params = client.suggested_params()

goal = 5_000_000       # 5 Algo (microAlgos)
deadline = int(time.time()) + 3600  # 1 hour from now

txn = ApplicationCreateTxn(
    sender=address,
    sp=params,
    on_complete=OnComplete.NoOpOC,
    approval_program=approval_bin,
    clear_program=clear_bin,
    global_schema=StateSchema(4, 1),
    local_schema=StateSchema(1, 0),
    app_args=[
        goal.to_bytes(8, "big"),
        deadline.to_bytes(8, "big")
    ]
)

signed = txn.sign(private_key)
txid = client.send_transaction(signed)
print("Deploy TXID:", txid)

result = wait_for_confirmation(client, txid, 4)
print("APP ID:", result["application-index"])
