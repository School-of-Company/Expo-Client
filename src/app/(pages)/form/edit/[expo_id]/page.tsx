import EditForm from '@/views/form/edit/ui/EditForm';

const page = ({ params }: { params: { expo_id: string } }) => {
  return <EditForm id={params.expo_id} />;
};

export default page;
