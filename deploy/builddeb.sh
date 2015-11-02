#!/bin/bash -e
#
# Build the .deb package
#
test `id -u` == "0" || (echo "Run as root" && exit 1) # requires bash -e

#
# The package name
#
NAME=markbook
ARCH=noarch

#
# Select the files to include
#
cd `dirname $0`/..
PROJECT_ROOT=`pwd`

#
# Generate the _output using this version of markbook, not the installed one.
#
bin/markbook handbook handbook_output
bin/markbook simple simple_output

#
# Copy files e.g.   cp --archive src/* ${PROJECT_ROOT}/deploy/root/opt/$NAME/
#
mkdir -p ${PROJECT_ROOT}/deploy/root/usr/share/markbook/{bin,doc,lib,simple}
mkdir -p ${PROJECT_ROOT}/deploy/root/usr/bin
cp --archive bin/* ${PROJECT_ROOT}/deploy/root/usr/share/markbook/bin
cp --archive handbook_output/* ${PROJECT_ROOT}/deploy/root/usr/share/markbook/doc
cp --archive lib/* ${PROJECT_ROOT}/deploy/root/usr/share/markbook/lib
cp --archive simple_output/* ${PROJECT_ROOT}/deploy/root/usr/share/markbook/simple
chmod +x ${PROJECT_ROOT}/deploy/root/usr/share/markbook/bin/*
echo '#!/bin/sh
/usr/share/markbook/bin/markbook $*' > ${PROJECT_ROOT}/deploy/root/usr/bin/markbook
chmod +x ${PROJECT_ROOT}/deploy/root/usr/bin/markbook

FILES=${PROJECT_ROOT}/deploy/root

#
# Create a temporary build directory
#
TMP_DIR=/tmp/${NAME}_debbuild
rm -rf ${TMP_DIR}
mkdir -p ${TMP_DIR}
. ./version
sed -e "s/@PACKAGE_VERSION@/${VERSION}/" ${PROJECT_ROOT}/deploy/DEBIAN/control.in > ${PROJECT_ROOT}/deploy/DEBIAN/control
cp --archive -R ${FILES}/* ${TMP_DIR}/

SIZE=$(du -sk ${TMP_DIR} | cut -f 1)
sed -i -e "s/@SIZE@/${SIZE}/" ${PROJECT_ROOT}/deploy/DEBIAN/control

cp --archive -R ${PROJECT_ROOT}/deploy/DEBIAN ${TMP_DIR}/

#
# Setup the installation package ownership here if it needs root
#
chown -R root.root ${TMP_DIR}/usr/* 
#chown root.root \
#  ${TMP_DIR}/root \
#  ${TMP_DIR}/home \
#  ${TMP_DIR}/usr/bin ${TMP_DIR}/usr \

#
# Build the .deb
#
dpkg-deb --build ${TMP_DIR} ${NAME}-${VERSION}-1.${ARCH}.deb

test -f ${NAME}-${VERSION}-1.${ARCH}.deb

echo "built ${NAME}-${VERSION}-1.${ARCH}.deb"

