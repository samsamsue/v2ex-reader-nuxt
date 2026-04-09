docker rm -f v2nuxt \
docker build -t v2nuxt . \
docker tag v2nuxt yiroon/v2nuxt:latest \
docker push yiroon/v2ex-reader:latest