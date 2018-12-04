npm i;
cp webgl-obj-loader.d.ts node_modules/webgl-obj-loader;
cd node_modules/webgl-obj-loader;
mv webgl-obj-loader.d.ts index.d.ts;
cd ../..;
npm run-script build;
