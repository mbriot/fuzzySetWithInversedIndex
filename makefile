SRC = $(shell find ./lib -name  '*.js')
NODE ?= /usr/local/bin/node
NPM ?= /usr/local/bin/npm
UGLIFYJS ?= ./node_modules/.bin/uglifyjs

all: clean node_modules decatIndex.min.js

decatIndex.js: $(SRC)
	mkdir -p ./build
	cat ./lib/wrapper_start $^ ./lib/wrapper_end > ./build/$@

decatIndex.min.js: decatIndex.js
	${UGLIFYJS} --compress --mangle --comments < ./build/$< > ./build/$@

clean:
	rm -Rf ./build ./node_modules

node_modules:
	${NPM} -s install
