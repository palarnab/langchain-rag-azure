if (Test-Path -Path '.\\dist'){ Remove-Item -Path '.\\dist' -Force -Recurse }
if (Test-Path -Path 'rag-poc-backend.zip'){ Remove-Item -Path 'rag-poc-backend.zip' -Force }
npm run build
Rename-Item -Path '.\\dist\\index.js' -NewName server.js
Remove-Item -Path '.\\dist\\config.env' -Force
Remove-Item -Path '.\\dist\\public' -Force -Recurse
# Copy-Item -Path '.\\build\\*' -Destination '.\\dist' -Recurse -Force
# Copy-Item -Path '.\\public' -Destination '.\\dist\\public' -Recurse -Force
# if ($args[0] -eq 'prod'){ Remove-Item -Path '.\\dist\\public\\swagger' -Force -Recurse }
Remove-Item -Path '.\\dist\\public\\swagger' -Force -Recurse
Compress-Archive -Path '.\\dist\*' -DestinationPath 'rag-poc-backend.zip'