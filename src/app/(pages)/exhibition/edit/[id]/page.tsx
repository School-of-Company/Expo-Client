import EditExhibition from '@/views/exhibition/edit/ui/editExhibition';

const page = ({ params }: { params: { id: string } }) => {
  return <EditExhibition id={params.id} />;
};

export default page;
