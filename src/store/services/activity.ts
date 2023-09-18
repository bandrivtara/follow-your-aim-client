import {
  collection,
  doc,
  updateDoc,
  getDocs,
  addDoc,
  getDoc,
} from "firebase/firestore";
import { IActivityData, IActivityDetails } from "../../types/activity.types";
import { api, db } from "../api";

export const activityFirestoreApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getActivityList: builder.query<IActivityData[], void>({
      async queryFn() {
        try {
          const ref = collection(db, "activity");
          const querySnapshot = await getDocs(ref);
          let activityList: IActivityData[] = [];
          querySnapshot?.forEach((doc) => {
            activityList.push({
              id: doc.id,
              ...doc.data(),
            } as IActivityData);
          });

          return { data: activityList };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      providesTags: ["Activity"],
    }),

    getActivity: builder.query({
      async queryFn(activityId) {
        try {
          const activityRef = doc(db, "activity", activityId);
          const activitySnapshot = await getDoc(activityRef);
          if (activitySnapshot.exists()) {
            return {
              data: {
                id: activitySnapshot.id,
                ...activitySnapshot.data(),
              } as IActivityData,
            };
          }

          throw new Error("Activity not found");
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      providesTags: ["Activity"],
    }),

    addActivity: builder.mutation({
      async queryFn(activityDetails: IActivityDetails) {
        try {
          await addDoc(collection(db, "activity"), {
            details: activityDetails,
          });
          return { data: null };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["Activity"],
    }),
    updateActivity: builder.mutation({
      async queryFn(activityDetails) {
        try {
          await updateDoc(doc(db, "activity", activityDetails.id), {
            [activityDetails.path]: activityDetails.data,
          });
          return { data: null };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["Activity"],
    }),
  }),
});

export const {
  useGetActivityQuery,
  useGetActivityListQuery,
  useAddActivityMutation,
  useUpdateActivityMutation,
} = activityFirestoreApi;
