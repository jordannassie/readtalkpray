export type AgreementInput = {
  leaderName: string;
  groupName: string;
  email: string;
  city: string;
  country: string;
  meetingLocation: string;
  attended: boolean;
  faithAgreed: boolean;
  commitmentsAgreed: boolean;
  zoomAgreed: boolean;
  privacyAgreed: boolean;
};

export function applicationFieldIssues(input: AgreementInput) {
  const fields: Record<string, string> = {};
  if (!input.leaderName.trim()) fields.leaderName = "Enter your name.";
  if (!input.groupName.trim()) fields.groupName = "Enter a group name.";
  if (!input.email.trim()) fields.email = "Email is missing from this sign-in.";
  if (!input.city.trim()) fields.city = "Enter a city.";
  if (!input.country.trim()) fields.country = "Enter a country.";
  if (!input.meetingLocation.trim()) fields.meetingLocation = "Enter a meeting location.";
  if (!input.faithAgreed || !input.commitmentsAgreed) {
    fields.leaderAgreement = "Agreement to the statement of faith and leader commitments is required.";
  }
  return fields;
}

export function applicationIssues(input: AgreementInput) {
  return Object.values(applicationFieldIssues(input))[0] ?? null;
}
