export type PoseOption = "standing" | "walking" | "smiling" | "hand under chin" | "looking back";
export type BackdropOption = "Chandigarh garden" | "brick wall" | "street" | "courtyard" | "studio";
export type ExpressionOption = "charming smile" | "soft smile" | "confident" | "looking away";
export type FootwearOption = "match outfit" | "white footwear" | "juttis" | "heels";
export type AspectRatioOption = "4:5" | "9:16" | "1:1" | "3:4";
export type DressTypeOption =
  | "auto"
  | "salwar kameez"
  | "patiala suit"
  | "palazzo suit"
  | "straight salwar suit"
  | "anarkali suit"
  | "sharara suit"
  | "gharara suit"
  | "churidar suit"
  | "punjabi suit with dupatta"
  | "kurti with jeans"
  | "kurti with palazzo"
  | "lehenga suit"
  | "co-ord set"
  | "maxi dress"
  | "midi dress"
  | "western dress"
  | "jumpsuit"
  | "blazer suit"
  | "shirt and trousers"
  | "skirt and top"
  | "jeans and top"
  | "other";
export type OutfitAnalysis = {
  garmentType: string;
  colors: string[];
  neckline?: string;
  sleeves?: string;
  bottomType?: string;
  dupatta?: string;
  patterns?: string[];
  notes: string[];
};

export type GenerateRequest = {
  outfitId: string;
  pose: PoseOption | "other";
  backdrop: BackdropOption | "other";
  expression: ExpressionOption | "other";
  footwear: FootwearOption | "other";
  customPose?: string;
  customBackdrop?: string;
  customExpression?: string;
  customFootwear?: string;
  dressType?: DressTypeOption;
  customDressType?: string;
  aspectRatio?: AspectRatioOption;
  count: number;
};

export type GeneratedImage = {
  id: string;
  outfit_id: string | null;
  image_url: string;
  thumbnail_url: string | null;
  prompt_text: string;
  is_favorite: boolean;
  created_at: string;
};
