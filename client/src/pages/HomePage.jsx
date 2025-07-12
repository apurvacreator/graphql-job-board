import JobList from '../components/JobList';
import { useJobs } from '../lib/graphql/hooks';

function HomePage() {
  const { jobs, loading, error } = useJobs();

  if(loading) {
    return <div>Loading...</div>
  }

  if(error) {
    return <div className='has-text-danger'>Data Unavailable</div>
  }

  return (
    <div>
      <h1 className="title">
        Job Board
      </h1>
      <JobList jobs={jobs} />
    </div>
  );
}

export default HomePage;
