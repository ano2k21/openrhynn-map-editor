import { MapEditor } from '@/components/editor/MapEditor';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Rhynn Map Editor - Create and Edit Game Maps</title>
        <meta name="description" content="Browser-based map editor for Rhynn MMORPG. Create, edit, and export maps with 24x24 tile support, portal management, and binary data export." />
      </Helmet>
      <MapEditor />
    </>
  );
};

export default Index;
