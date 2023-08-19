interface LinksInfoItem {
  source: string;
  target: string;
}

interface tmpObjType {
  packageName:string
  version:string
  depth:number
  dependencies: any;
}

interface categoriesItem{
    name:string
}
export type { LinksInfoItem ,tmpObjType,categoriesItem};
