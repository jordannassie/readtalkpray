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
  if (!input.attended) return "Confirm that you have attended a Read Talk Pray group once.";
  if (!input.faithAgreed) return "Agreement to the statement of faith is required.";
  if (!input.commitmentsAgreed) return "Agreement to the leader commitments is required.";
  if (!input.zoomAgreed) return "Agreement to the monthly leader Zoom meeting is required.";
  if (!input.privacyAgreed) return "Contact and privacy consent is required.";
  return null;
}
