const ComingSoon = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-[60vh]">
    <div className="text-center">
      <h2 className="text-2xl font-display mb-2">{title}</h2>
      <p className="text-muted-foreground">This feature is coming soon.</p>
    </div>
  </div>
);

export default ComingSoon;
