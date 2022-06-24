.PHONY: web

protox:
	./node_modules/protobufjs/bin/pbjs -t \
	static-module --es6 -w default --no-comments -o ./proto/proto.js \
	./proto/protos/*.proto

