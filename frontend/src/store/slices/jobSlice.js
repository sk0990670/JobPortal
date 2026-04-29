import { createSlice } from '@reduxjs/toolkit';

const jobSlice = createSlice({
  name: 'jobs',
  initialState: {
    jobs: [],
    selectedJob: null,
    filters: {
      search: '',
      jobType: [],
      workMode: [],
      location: '',
      skills: [],
      minSalary: 0,
      maxSalary: 150000,
      batch: '',
    },
    pagination: { page: 1, limit: 10, total: 0, pages: 0 },
    sort: '-createdAt',
    isLoading: false,
  },
  reducers: {
    setJobs: (state, action) => {
      state.jobs = action.payload.data;
      state.pagination = {
        page: action.payload.page,
        limit: action.payload.limit || 10,
        total: action.payload.total,
        pages: action.payload.pages,
      };
    },
    setSelectedJob: (state, action) => { state.selectedJob = action.payload; },
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    resetFilters: (state) => {
      state.filters = { search: '', jobType: [], workMode: [], location: '', skills: [], minSalary: 0, maxSalary: 150000, batch: '' };
      state.pagination.page = 1;
    },
    setPage: (state, action) => { state.pagination.page = action.payload; },
    setSort: (state, action) => { state.sort = action.payload; },
    setLoading: (state, action) => { state.isLoading = action.payload; },
  },
});

export const { setJobs, setSelectedJob, setFilters, resetFilters, setPage, setSort, setLoading } = jobSlice.actions;
export const selectJobs = (state) => state.jobs;
export default jobSlice.reducer;
