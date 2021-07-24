import { FiCalendar, FiUser } from 'react-icons/fi';

import { GetStaticProps } from 'next';
import commonStyles from '../styles/common.module.scss';
import { getPrismicClient } from '../services/prismic';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home() {
  // TODO
  return (
    <>
      <main className={commonStyles.smallBorder}>
        <div className={styles.posts}>
          <a href="#">
            <strong>Como utilizar Hooks</strong>
            <p>Pensando em sincronização em vez de ciclos de vida.</p>
            <div className="info">
              <span>
                <FiCalendar />
                <time>19 Abr 2021</time>
              </span>
              <span>
                <FiUser />
                Joseph Oliveira
              </span>
            </div>
          </a>
        </div>
      </main>
    </>
  )
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);

//   // TODO
// };
