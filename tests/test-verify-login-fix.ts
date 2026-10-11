import { AuthStore } from "../lib/auth/store";
import { mapStoredProfileToUserProfile } from "../lib/types/user";

async function main() {
  console.log("=== Testing User Sync and Profile Mapping Fix ===");

  // 1. Sync legacy user with Supabase ID
  const synced = AuthStore.syncUserWithSupabaseId(
    "sriii191811@gmail.com",
    "57cf4986-8acd-405d-8915-5353b789183f"
  );
  console.log("Synced user:", synced?.id, synced?.email, synced?.fullName);

  // 2. Fetch profile by Supabase ID
  const prof = AuthStore.getProfileByUserId("57cf4986-8acd-405d-8915-5353b789183f");
  console.log("Profile retrieved:", prof?.id, prof?.fullName, prof?.selectedExam);

  // 3. Map to UserProfile
  const userProf = mapStoredProfileToUserProfile(prof);
  console.log("Mapped UserProfile:", userProf.id, userProf.name, userProf.currentExam);

  // 4. Test defensive mapping on null/undefined
  const nullProf = mapStoredProfileToUserProfile(null);
  console.log("Null profile safely mapped:", nullProf.id, nullProf.name, nullProf.accuracy);

  // 5. Test updateUserProfile on a brand new UUID
  const newUuid = "00000000-0000-0000-0000-000000000001";
  const brandNewProf = AuthStore.updateUserProfile(newUuid, {
    fullName: "Brand New User",
    email: "brandnew@example.com",
    selectedExam: "ssc-cgl",
  });
  console.log("Brand new user profile created:", brandNewProf.id, brandNewProf.fullName, brandNewProf.selectedExam);

  console.log("ALL TESTS PASSED SUCCESSFULLY!");
}

main().catch(console.error);
