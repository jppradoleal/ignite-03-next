import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { GetStaticPaths, GetStaticPathsResult, GetStaticProps } from 'next';
import { useEffect, useState } from 'react';

import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import commonStyles from '../../styles/common.module.scss';
import format from 'date-fns/format';
import { getPrismicClient } from '../../services/prismic';
import { ptBR } from 'date-fns/locale';
import styles from './post.module.scss';
import { useRouter } from 'next/router';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) return <p>Carregando...</p>

  const [readingTime, setReadingTime] = useState(0);

  useEffect(() => {
    const totalWords = post.data.content.reduce((total, content) => {
      const headingWords = content.heading.split(" ").length;
      const bodyWords = RichText.asText(content.body).split(" ").length;
      return total + headingWords + bodyWords;
    }, 0);

    setReadingTime(Math.ceil(totalWords/200));
  }, []);

  return (
    <article className={styles.post}>
      <div className={styles.banner} style={{ background: `url(${post.data.banner.url})` }}></div>
      <div className={`${commonStyles.smallBorder}`}>
        <header>
          <h1>{post.data.title}</h1>
          <div className={commonStyles.info}>
            <span>
              <FiCalendar />
              <time>{
                format(new Date(post.first_publication_date), "dd MMM yyyy", {
                  locale: ptBR
                })
              }</time>
            </span>
            <span>
              <FiUser />
              {post.data.author}
            </span>
            <span>
              <FiClock />
              {readingTime} min
            </span>
          </div>
        </header>
        <div className={styles.postContent}>
          {post.data.content.map(content => (
            <section key={content.heading}>
              <h2>{content.heading}</h2>
              <div dangerouslySetInnerHTML={{ __html: RichText.asHtml(content.body) }}></div>
            </section>
          ))}
        </div>
      </div>
    </article>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ]);

  const prehandledPosts = posts.results.map(post => ({ params: { slug: post.uid } }));

  // TODO
  return {
    paths: prehandledPosts,
    fallback: true,
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();

  const { slug } = params;

  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      subtitle: response.data.subtitle,
      title: response.data.title,
      author: response.data.author,
      banner: response.data.banner,
      content: response.data.content,
    }
  }

  return {
    props: {
      post,
    },
    revalidate: 60 * 30,
  }
};
