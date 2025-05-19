import CreateForm from '@/views/form/create/ui/createForm';

const page = ({ params }: { params: { expo_id: string } }) => {
  return <CreateForm id={params.expo_id} />;
};

export default page;
