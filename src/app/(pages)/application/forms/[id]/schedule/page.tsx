import { redirect } from 'next/navigation';

/** 일정은 신청 목록의 사전등록 탭으로 합쳤다. 이미 공유된 링크를 위해 남겨 둔다 */
const page = ({ params }: { params: { id: string } }) => {
  redirect(`/application/forms/${params.id}?view=list`);
};

export default page;
