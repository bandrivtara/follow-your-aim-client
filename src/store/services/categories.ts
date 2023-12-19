import {
  collection,
  doc,
  updateDoc,
  getDocs,
  addDoc,
  getDoc,
} from "firebase/firestore";
import { ICategory, ICategoryData } from "../../types/categories.types";
import { api, db } from "../api";

export const categoriesFirestoreApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCategoriesList: builder.query<ICategoryData[], void>({
      async queryFn() {
        try {
          const ref = collection(db, "sphere");
          const querySnapshot = await getDocs(ref);
          let categoriesList: ICategoryData[] = [];
          querySnapshot?.forEach((doc) => {
            categoriesList.push({
              id: doc.id,
              ...doc.data(),
            } as ICategoryData);
          });

          return { data: categoriesList };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      providesTags: ["Categories"],
    }),

    getCategory: builder.query({
      async queryFn(categoriesId) {
        try {
          const categoriesRef = doc(db, "sphere", categoriesId);
          const categoriesSnapshot = await getDoc(categoriesRef);
          if (categoriesSnapshot.exists()) {
            return {
              data: {
                id: categoriesSnapshot.id,
                ...categoriesSnapshot.data(),
              } as ICategoryData,
            };
          }

          throw new Error("Categories not found");
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      providesTags: ["Categories"],
    }),

    addCategory: builder.mutation({
      async queryFn(categoriesDetails: ICategory) {
        try {
          await addDoc(collection(db, "sphere"), categoriesDetails);
          return { data: null };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["Categories"],
    }),
    updateCategory: builder.mutation({
      async queryFn(categoriesDetails) {
        try {
          console.log(categoriesDetails, 555);
          await updateDoc(
            doc(db, "sphere", categoriesDetails.id),
            categoriesDetails.data
          );
          return { data: null };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["Categories"],
    }),
  }),
});

export const {
  useGetCategoryQuery,
  useGetCategoriesListQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
} = categoriesFirestoreApi;
