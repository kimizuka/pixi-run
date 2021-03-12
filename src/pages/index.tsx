import 'reset-css';
import dynamic from 'next/dynamic';
import Head from 'next/head';

import { useEffect, useState, useRef } from 'react';

const GameTemplateNoSSR = dynamic(() => import('../components/templates/GameTemplate'), {
  ssr: false
});

export default function IndexPage() {
  return (
    <div>
      <GameTemplateNoSSR />
    </div>
  );
}
