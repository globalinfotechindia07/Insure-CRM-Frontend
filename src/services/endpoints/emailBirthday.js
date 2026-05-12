// src/services/endpoints/emailBirthday.js
import { baseApi } from 'services/baseApi';

export const emailBirthdayApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ========== Email Configuration ==========
    
    // Save/Update email configuration
    saveEmailConfig: builder.mutation({
      query: (data) => ({
        url: 'email-config',
        method: 'POST',
        body: data
      }),
      transformResponse: (res) => res?.data,
      invalidatesTags: ['EmailConfig']
    }),

    // Get active email configuration
    getEmailConfig: builder.query({
      query: () => 'email-config',
      transformResponse: (res) => res?.data,
      providesTags: ['EmailConfig']
    }),

    // Get all email configurations
    getAllEmailConfigs: builder.query({
      query: () => 'email-config/all',
      transformResponse: (res) => res?.data,
      providesTags: ['EmailConfig']
    }),

    // Update email configuration
    updateEmailConfig: builder.mutation({
      query: ({ id, data }) => ({
        url: `email-config/${id}`,
        method: 'PUT',
        body: data
      }),
      transformResponse: (res) => res?.data,
      invalidatesTags: ['EmailConfig']
    }),

    // Delete email configuration
    deleteEmailConfig: builder.mutation({
      query: (id) => ({
        url: `email-config/${id}`,
        method: 'DELETE'
      }),
      transformResponse: (res) => res?.data,
      invalidatesTags: ['EmailConfig']
    }),

    // Send test email
    sendTestEmail: builder.mutation({
      query: (data) => ({
        url: 'test-email',
        method: 'POST',
        body: data
      }),
      transformResponse: (res) => res?.data
    }),

    // ========== Birthday Management ==========

    // Get birthday logs with filters
    getBirthdayLogs: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return `birthday-logs${queryParams ? `?${queryParams}` : ''}`;
      },
      transformResponse: (res) => res?.data,
      providesTags: ['BirthdayLog']
    }),

    // Get single birthday log
    getBirthdayLogById: builder.query({
      query: (id) => `birthday-logs/${id}`,
      transformResponse: (res) => res?.data,
      providesTags: ['BirthdayLog']
    }),

    // Get upcoming birthdays
    getUpcomingBirthdays: builder.query({
      query: (days = 30) => `upcoming-birthdays?days=${days}`,
      transformResponse: (res) => res?.data,
      providesTags: ['Birthday']
    }),

    // Manual birthday check for specific employee
    manualBirthdayCheck: builder.mutation({
      query: (employeeId) => ({
        url: `manual-birthday-check/${employeeId}`,
        method: 'POST'
      }),
      transformResponse: (res) => res?.data,
      invalidatesTags: ['BirthdayLog', 'Birthday']
    }),

    // Check all birthdays for today
    checkAllBirthdays: builder.mutation({
      query: () => ({
        url: 'birthday/check-all',
        method: 'POST'
      }),
      transformResponse: (res) => res?.data,
      invalidatesTags: ['BirthdayLog', 'Birthday']
    }),

    // Get employees with birthday today
    getEmployeesWithBirthdayToday: builder.query({
      query: () => 'employees-with-birthday-today',
      transformResponse: (res) => res?.data,
      providesTags: ['Birthday']
    }),

    // Update employee date of birth (for testing)
    updateEmployeeDOB: builder.mutation({
      query: ({ id, dateOfBirth }) => ({
        url: `employee/${id}/dateOfBirth`,
        method: 'PUT',
        body: { dateOfBirth }
      }),
      transformResponse: (res) => res?.data,
      invalidatesTags: ['Birthday', 'Employee']
    }),

    // Get birthday statistics
    getBirthdayStatistics: builder.query({
      query: () => 'birthday-statistics',
      transformResponse: (res) => res?.data,
      providesTags: ['BirthdayLog']
    })
  })
});

// ========== Export all hooks ==========

// Email Configuration Hooks
export const {
  useSaveEmailConfigMutation,
  useGetEmailConfigQuery,
  useGetAllEmailConfigsQuery,
  useUpdateEmailConfigMutation,
  useDeleteEmailConfigMutation,
  useSendTestEmailMutation
} = emailBirthdayApi;

// Birthday Management Hooks
export const {
  useGetBirthdayLogsQuery,
  useGetBirthdayLogByIdQuery,
  useGetUpcomingBirthdaysQuery,
  useManualBirthdayCheckMutation,
  useCheckAllBirthdaysMutation,
  useGetEmployeesWithBirthdayTodayQuery,
  useUpdateEmployeeDOBMutation,
  useGetBirthdayStatisticsQuery
} = emailBirthdayApi;