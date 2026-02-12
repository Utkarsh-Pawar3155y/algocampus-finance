import os
from algosdk.v2client import algod
from dotenv import load_dotenv

load_dotenv(".env")

APP_ID = 755303790
ADDRESS = "LVFNYPXP446V7VYLBSHUOKMF6UELOLMZ5OR7C6GG2TFGZ6U3AUY3WY4UTA"

client = algod.AlgodClient(
    os.getenv("ALGOD_TOKEN"),
    os.getenv("ALGOD_ADDRESS")
)

info = client.account_application_info(ADDRESS, APP_ID)

print("===== LOCAL STATE =====")
print(info)
