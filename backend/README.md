Private Key: openssl genrsa -out private_key.pem 2048
Public Key: openssl rsa -in private_key.pem -pubout -out public_key.pem