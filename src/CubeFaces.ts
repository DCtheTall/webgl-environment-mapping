interface CubeFaces<T> {
  [index: string]: T;
  front: T;
  back: T;
  left: T;
  right: T;
  top: T;
  bottom: T;
}

export default CubeFaces;
