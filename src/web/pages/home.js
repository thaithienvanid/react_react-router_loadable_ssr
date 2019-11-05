import React from 'react'

import { Trans } from 'react-i18next'

const Home = () => {
  return (
    <React.Fragment>
      <h1>
        <Trans i18nKey="welcome">Default!</Trans>
      </h1>
    </React.Fragment>
  )
}

export default Home
