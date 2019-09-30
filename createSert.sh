#!/bin/bash
FQDN=$1

mkdir -p ssl/

# Create your very own Root Certificate Authority
openssl genrsa -out ssl/CAroot-key.pem 2048

# Self-sign your Root Certificate Authority
# Since this is private, the details can be as bogus as you like
openssl req \
  -x509 \
  -new \
  -nodes \
  -key ssl/CAroot-key.pem \
  -days 1024 \
  -out ssl/CAroot-cert.pem \
  -subj "/C=US/ST=Utah/L=Provo/O=ACME Signing Authority Inc/CN=example.com"

# Create a Device Certificate for each domain,
# such as example.com, *.example.com, awesome.example.com
# NOTE: You MUST match CN to the domain name or ip address you want to use
openssl genrsa -out ssl/privkey.pem 2048

# Create a request from your Device, which your Root CA will sign
openssl req -new \
  -key ssl/privkey.pem \
  -out ssl/csr.pem \
  -subj "/C=US/ST=Utah/L=Provo/O=ACME Tech Inc/CN=${FQDN}"

# Sign the request from Device with your Root CA
openssl x509 \
  -req -in ssl/csr.pem \
  -CA ssl/CAroot-cert.pem \
  -CAkey ssl/CAroot-key.pem \
  -CAcreateserial \
  -out ssl/cert.pem \
  -days 500

cat ssl/cert.pem > ssl/fullchain.pem
