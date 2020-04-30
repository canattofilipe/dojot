#!/bin/bash

#########################################################

#########################################################

BASE_DIR=${BASE_DIR:-"/k2v_bridge"}

. "${BASE_DIR}"/bin/scripts_tls/_initVariables.sh

cat "${certDir}"/"${certCaFile}" "${certDir}"/"${certCrlFile}" > "${certDir}"/crl_chain.pem

if openssl verify -crl_check -CAfile "${certDir}"/crl_chain.pem "${certDir}"/"${certCertFile}"
then
  echo "Certificate for broker is not revoked!"
else
  echo "Certificate for broker has been revoked!"
  echo "Renew:"
  . "${BASE_DIR}"/bin/scripts_tls/ejbca_client.sh
fi

rm "${certDir}"/crl_chain.pem