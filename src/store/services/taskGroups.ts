import {
  collection,
  doc,
  updateDoc,
  getDocs,
  addDoc,
  getDoc,
} from "firebase/firestore";
import { api, db } from "../api";
import { ITasksGroup } from "types/taskGroups";

export const taskGroupFirestoreApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTaskGroupList: builder.query<ITasksGroup[], void>({
      async queryFn() {
        try {
          const ref = collection(db, "taskGroup");
          const querySnapshot = await getDocs(ref);
          let taskGroupList: ITasksGroup[] = [];
          querySnapshot?.forEach((doc) => {
            taskGroupList.push({
              id: doc.id,
              ...doc.data(),
            } as ITasksGroup);
          });

          return { data: taskGroupList };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      providesTags: ["TaskGroup"],
    }),

    getTaskGroup: builder.query({
      async queryFn(taskGroupId) {
        try {
          const taskGroupRef = doc(db, "taskGroup", taskGroupId);
          const taskGroupSnapshot = await getDoc(taskGroupRef);
          if (taskGroupSnapshot.exists()) {
            return {
              data: {
                id: taskGroupSnapshot.id,
                ...taskGroupSnapshot.data(),
              } as ITasksGroup,
            };
          }

          throw new Error("TaskGroup not found");
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      providesTags: ["TaskGroup"],
    }),

    addTaskGroup: builder.mutation({
      async queryFn(taskGroupDetails: ITasksGroup) {
        try {
          await addDoc(collection(db, "taskGroup"), taskGroupDetails);
          return { data: null };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["TaskGroup"],
    }),
    updateTaskGroup: builder.mutation({
      async queryFn(taskGroupDetails) {
        try {
          await updateDoc(
            doc(db, "taskGroup", taskGroupDetails.id),
            taskGroupDetails.data
          );
          return { data: null };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["TaskGroup"],
    }),
  }),
});

export const {
  useGetTaskGroupQuery,
  useGetTaskGroupListQuery,
  useAddTaskGroupMutation,
  useUpdateTaskGroupMutation,
} = taskGroupFirestoreApi;
