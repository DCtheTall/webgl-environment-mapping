import parseWavefrontObj, { WavefrontObjParsedJSON } from 'wavefront-obj-parser';

export default class Model {
  constructor(wavefrontString: string) {
    const objJSON: WavefrontObjParsedJSON = parseWavefrontObj(wavefrontString);
  }
}
