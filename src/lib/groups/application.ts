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

export function applicationIssues(input: AgreementInput) {
  if (!input.leaderName || !input.groupName || !input.email || !input.city || !input.country || !input.meetingLocation) {
    return "Name, group name, email, city, country, and meeting location are needed.";
  }
  if (!input.faithAgreed || !input.commitmentsAgreed) return "Agreement to the statement of faith and leader commitments is required.";
  return null;
}
