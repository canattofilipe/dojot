#!/bin/bash

#########################################################
#########################################################

. "${V2K_APP_BASEDIR}"/bin/scripts_tls/_initVariables.sh
. "${V2K_APP_BASEDIR}"/bin/scripts_tls/saveFormattedCRT.sh

echo "Signing cert for entity ${certCname} in ${certCAName} : ${certEjbcaApiUrl}/sign/${certCname}/pkcs10 "
csrContent=$(<  "${certDir}"/"${certCsrFile}"  sed '1,1d;$ d' | tr -d '\r\n')

signCertCa=$(curl --silent -X POST "${certEjbcaApiUrl}"/sign/"${certCname}"/pkcs10 \
-H "Content-Type:application/json" \
-H "Accept:application/json" \
-d  "{
\"passwd\": \"${password}\",
\"certificate\": \"${csrContent}\"
}" | jq '.status.data' -r)

_saveFormattedCRT "${certDir}/${certCertFile}" "${signCertCa}"
