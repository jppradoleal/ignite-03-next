import Link from 'next/link';
import commonStyle from '../../styles/common.module.scss';
import style from './header.module.scss'

export default function Header() {
  // TODO
  return (
    <header className={style.container}>
      <div className={`${commonStyle.smallBorder} ${style.headerContent}`}>
        <Link href="/">
          <a>
            <img src="/Logo.svg" alt="logo" />
          </a>
        </Link>
      </div>
    </header>
  )
}
