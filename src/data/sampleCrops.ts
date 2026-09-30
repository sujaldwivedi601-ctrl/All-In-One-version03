export interface SampleCropImage {
  id: string;
  name: string;
  crop: string;
  suspectedIssue: string;
  stage: string;
  imageUrl: string;
  notes: string;
}

export const SAMPLE_CROP_IMAGES: SampleCropImage[] = [
  {
    id: 'sample-wheat-rust',
    name: 'Wheat Foliar Stripe Rust',
    crop: 'Wheat',
    suspectedIssue: 'Yellow Stripe Rust',
    stage: 'Tillering (35-40 days)',
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
    notes: 'Yellow-orange pustules aligned in linear stripes across upper leaf lamina.',
  },
  {
    id: 'sample-tomato-blight',
    name: 'Tomato Early Blight',
    crop: 'Tomato',
    suspectedIssue: 'Early Blight (Alternaria)',
    stage: 'Flowering Stage',
    imageUrl: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=800&q=80',
    notes: 'Concentric dark brown bullseye rings on lower leaves with yellow halo.',
  },
  {
    id: 'sample-cotton-leaf',
    name: 'Cotton Leaf Curl Virus',
    crop: 'Cotton',
    suspectedIssue: 'Leaf Curl Virus / Whitefly',
    stage: 'Vegetative (45 days)',
    imageUrl: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=800&q=80',
    notes: 'Upward curling of leaf margins, vein thickening, and stunted boll development.',
  },
  {
    id: 'sample-maize-healthy',
    name: 'Healthy Maize / Corn',
    crop: 'Maize',
    suspectedIssue: 'Healthy Plant Check',
    stage: 'Knee-High Stage',
    imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80',
    notes: 'Vibrant green upright canopy with no visible pest perforations or chlorosis.',
  },
];
