FROM mhart/alpine-node:5.7

MAINTAINER PRX <sysadmin@prx.org>

ENV TINI_VERSION v0.9.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini-static /tini
RUN chmod +x /tini

WORKDIR /app
EXPOSE 8080 8443

ENTRYPOINT ["/tini", "--", "npm", "run-script"]
CMD [ "start" ]

# s3fs for letsencrypt shared directory
ENV S3FS_VERSION 1.79
RUN apk --update add fuse libxml2-dev curl-dev && \
    apk --update add --virtual build-dependencies alpine-sdk automake autoconf fuse-dev && \
    wget -qO- https://github.com/s3fs-fuse/s3fs-fuse/archive/v${S3FS_VERSION}.tar.gz | tar xz && \
    (cd s3fs-fuse-${S3FS_VERSION} && ./autogen.sh && ./configure --prefix=/usr && make && make install) && \
    apk del build-dependencies && rm -rf s3fs-fuse-${S3FS_VERSION} && rm -rf /var/cache/apk/*

ADD . ./

# we've got 4 node_modules to build:
#   pngcrush-bin -> glibc
#   pngquant-bin -> libpng-dev, make (build), bash (build), g++ (build)
#   av           -> make
#   mp3          -> make
RUN apk --update add --virtual build-dependencies libpng-dev make bash g++ wget && \
    wget --quiet --no-check-certificate https://github.com/andyshinn/alpine-pkg-glibc/releases/download/2.22-r5/glibc-2.22-r5.apk -P /root && \
    apk --allow-untrusted add /root/glibc-2.22-r5.apk && \
    npm set progress=false && \
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
