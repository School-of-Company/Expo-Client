interface ScheduleSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-body2b text-black">{children}</p>
);

const ScheduleSection = ({
  title,
  description,
  children,
}: ScheduleSectionProps) => (
  <section className="space-y-[26px]">
    <div className="space-y-8">
      <p className="text-h2b text-black">{title}</p>
      {description && (
        <p className="text-body2r text-gray-500">{description}</p>
      )}
    </div>
    {children}
  </section>
);

export default ScheduleSection;
