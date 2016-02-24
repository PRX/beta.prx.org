FROM mhart/alpine-node:5.7

MAINTAINER PRX <sysadmin@prx.org>

ENV TINI_VERSION v0.9.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini-static /tini
RUN chmod +x /tini

WORKDIR /app
EXPOSE 8080

ENTRYPOINT ["/tini", "--", "npm", "run-script"]
CMD [ "start" ]

ADD . ./

# we've got 4 node_modules to build:
#   pngcrush-bin -> glibc
#   pngquant-bin -> libpng-dev, make (build), bash (build), g++ (build)
#   av           -> make
#   mp3          -> make
RUN apk --update add --virtual build-dependencies libpng-dev make bash g++ ca-certificates && \
    wget https://github.com/andyshinn/alpine-pkg-glibc/releases/download/2.22-r5/glibc-2.22-r5.apk -P /root && \
    apk --allow-untrusted add /root/glibc-2.22-r5.apk && \
    npm install --no-optional --ignore-scripts --loglevel error && \
    (cd node_modules/pngcrush-bin && npm run postinstall) && \
    (cd node_modules/pngquant-bin && npm run postinstall) && \
    npm run build && \
    npm prune --production --loglevel error && npm cache clean && \
    rm -rf config gulp src && \
    apk del build-dependencies && apk del glibc && rm -f /root/glibc-2.22-r5.apk && \
    (find / -type f -iname \*.apk-new -delete ; \
    rm -rf /var/cache/apk/* /tmp/* /var/tmp/* ; \
    find /usr/lib/node_modules/npm -name test -o -name .bin -type d | xargs rm -rf ; \
    rm -rf /usr/share/man /tmp/* /root/.npm /root/.node-gyp \
    /usr/lib/node_modules/npm/man /usr/lib/node_modules/npm/doc /usr/lib/node_modules/npm/html)
