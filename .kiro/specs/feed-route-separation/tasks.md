# Implementation Plan

- [x] 1. Set up dashboard route structure and layouts





  - Create `src/app/dashboard/layout.tsx` with persistent header and sidebar layout
  - Create `src/app/dashboard/trending/page.tsx` as the main feed route
  - Create `src/app/dashboard/trending/loading.tsx` with skeleton UI
  - Create `src/app/dashboard/trending/error.tsx` with error boundary
  - _Requirements: 4.1, 4.2, 5.4_

- [x] 2. Create dashboard-specific header component





  - Create `src/components/DashboardHeader.tsx` with application navigation
  - Implement active route state indication
  - Add responsive behavior for mobile/desktop layouts
  - Include proper ARIA labels and keyboard navigation support
  - _Requirements: 4.2, 4.3, 4.5_

- [x] 3. Implement FeedContainer with URL parameter management





  - Create `src/components/feed/FeedContainer.tsx` as orchestrating component
  - Implement URL parameter reading using `useSearchParams`
  - Add filter state management and URL synchronization
  - Create interfaces for FeedFilters and FeedParams types
  - _Requirements: 3.2, 3.3, 3.4_

- [x] 4. Set up React Query data fetching infrastructure





  - Install and configure React Query if not already present
  - Create `src/hooks/useTrending.ts` hook for feed data fetching
  - Implement query key generation based on filter parameters
  - Add proper error handling and retry logic for API calls
  - _Requirements: 3.2, 5.2_

- [x] 5. Refactor existing Feed component for new architecture





  - Move `src/components/Feed.tsx` to `src/components/feed/FeedList.tsx`
  - Modify component to receive data and handlers as props instead of managing state
  - Remove direct data fetching and state management from component
  - Maintain existing UI and styling
  - _Requirements: 3.5, 5.1_

- [x] 6. Create landing page focused on marketing




  - Modify `src/app/page.tsx` to remove Feed, Sidebar, and InsightsSidebar components
  - Keep Hero component and create marketing-focused layout
  - Add prominent CTA buttons that navigate to dashboard route
  - Ensure static cacheability by removing client-side data fetching
  - _Requirements: 1.1, 1.2, 1.4, 2.1_

- [x] 7. Implement client-side navigation with CTA components





  - Create `src/components/AnimatedCTA.tsx` with micro-interactions
  - Use Next.js Link component for client-side navigation to `/dashboard/trending`
  - Add proper ARIA labels and accessibility attributes
  - Implement brief animation delay before navigation (100-180ms)
  - _Requirements: 2.1, 2.2, 2.3, 6.1_

- [x] 8. Add filter components with URL parameter integration





  - Move existing filter logic into `src/components/feed/FeedFilters.tsx`
  - Implement URL parameter updates when filters change
  - Add support for sources, window, sort, and search parameters
  - Maintain existing filter UI and functionality
  - _Requirements: 3.2, 3.3, 3.4_

- [x] 9. Implement loading states and error boundaries





  - Create skeleton components for feed loading state
  - Implement staggered loading animations for feed items
  - Add error handling with retry functionality
  - Create user-friendly error messages for different error types
  - _Requirements: 2.5, 5.3, 5.5_

- [x] 10. Add animations and micro-interactions





  - Install framer-motion for layout animations
  - Implement shared element morphing between hero title and dashboard header
  - Add page transition animations with fade/slide effects
  - Create staggered entrance animations for feed items
  - Add prefers-reduced-motion accessibility support
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 11. Write unit tests for core components
  - Create tests for FeedContainer component behavior
  - Test URL parameter parsing and filter state management
  - Add tests for AnimatedCTA navigation behavior
  - Test DashboardLayout rendering and navigation state
  - _Requirements: 5.5_

- [ ]* 12. Add integration tests for route behavior
  - Test navigation flow from landing page to dashboard
  - Verify filter updates synchronize with URL parameters
  - Test error boundary behavior and recovery
  - Validate loading states and data fetching integration
  - _Requirements: 5.5_

- [ ] 13. Optimize bundle splitting and performance





  - Verify code splitting is working correctly for dashboard route
  - Implement lazy loading for heavy feed components
  - Add performance monitoring for route transitions
  - Optimize initial bundle size for landing page
  - _Requirements: 1.3, 5.1, 5.2_

- [ ] 14. Final integration and testing
  - Test complete user flow from landing to feed functionality
  - Verify all existing feed features work in new route structure
  - Test responsive behavior across different screen sizes
  - Validate accessibility compliance with keyboard navigation
  - _Requirements: 2.4, 3.5, 4.4, 4.5_