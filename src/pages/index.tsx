import { FiCalendar, FiUser } from 'react-icons/fi';

import ApiSearchResponse from '@prismicio/client/types/ApiSearchResponse';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import commonStyles from '../styles/common.module.scss';
import { format } from 'date-fns';
import { getPrismicClient } from '../services/prismic';
import ptBR from 'date-fns/locale/pt-BR';
import styles from './home.module.scss';
import { useState } from 'react';

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

export default function Home({ postsPagination: { results: initialResult, next_page } }: HomeProps) {
  // TODO
  const [results, setResults] = useState(initialResult);
  const [nextPage, setNextPage] = useState(next_page);

  function handleLoadMore() {
    if (nextPage) {
      fetch(nextPage)
        .then(response => response.json()).
        then(data => {
          const posts = treatPrismicPostData(data);

          setResults(results => [...results, ...posts]);
          setNextPage(data.next_page);
        });
    }
  }

  return (
    <>
      <main className={commonStyles.smallBorder}>
        <div className={styles.posts}>
          {results.map(post => {
            return (
              <Link href={`/post/${post.uid}`} key={post.uid}>
                <a>
                  <strong>{post.data.title}</strong>
                  <p>{post.data.subtitle}</p>
                  <div className={commonStyles.info}>
                    <span>
                      <FiCalendar />
                      <time>{
                        format(new Date(post.first_publication_date), "dd MMM yyyy", {
                          locale: ptBR
                        })}
                      </time>
                    </span>
                    <span>
                      <FiUser />
                      {post.data.author}
                    </span>
                  </div>
                </a>
              </Link>
            )
          })}

          {nextPage ? (
            <button className={styles.loadMore} onClick={handleLoadMore}>Carregar mais posts</button>
          ) : ''}
        </div>
      </main>
    </>
  )
}

function treatPrismicPostData(postsResponse: ApiSearchResponse) {
  return postsResponse.results.map(post => ({
    uid: post.uid,
    first_publication_date: post.first_publication_date,
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
    }
  }));
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: [
      'post.title',
      'post.subtitle',
      'post.author'
    ],
    pageSize: 1
  });

  const posts = treatPrismicPostData(postsResponse);

  // TODO
  return {
    props: {
      postsPagination: {
        results: posts,
        next_page: postsResponse.next_page
      }
    },
    revalidate: 60 * 60
  }
};
