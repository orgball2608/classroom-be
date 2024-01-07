export interface IcommentReview {
  id: number;
  reviewId: number;
  body: string;
  createdById: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    avatar: string;
  };
}
