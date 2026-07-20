import { loadPackage } from '@nestjs/common/utils/load-package.util';
import { isUndefined } from '@nestjs/common/utils/shared.utils';
import { ClientKafka } from '../client/client-kafka';
import {
  Cluster,
  GroupMember,
  GroupMemberAssignment,
  GroupState,
  MemberMetadata,
} from '../external/kafka.interface';

let kafkaPackage: any = {};

export class KafkaReplyPartitionAssigner {
  readonly name = 'NestReplyPartitionAssigner';
  readonly version = 1;

  constructor(
    private readonly clientKafka: ClientKafka,
    private readonly config: {
      cluster: Cluster;
    },
  ) {
      throw new Error("STUB");
  }

  /**
   * This process can result in imbalanced assignments
   * @param {array} members array of members, e.g: [{ memberId: 'test-5f93f5a3' }]
   * @param {array} topics
   * @param {Buffer} userData
   * @returns {array} object partitions per topic per member
   */
  public async assign(group: {
    members: GroupMember[];
    topics: string[];
  }): Promise<GroupMemberAssignment[]> {
    const assignment = {};
    const previousAssignment = {};

    const membersCount = group.members.length;
    const decodedMembers = group.members.map(member =>
      { throw new Error("STUB"); },
    );
    const sortedMemberIds = decodedMembers
      .map(member => { throw new Error("STUB"); })
      .sort();

    // build the previous assignment and an inverse map of topic > partition > memberId for lookup
    decodedMembers.forEach(member => {
        throw new Error("STUB");
    });

    // build a collection of topics and partitions
    const topicsPartitions = group.topics
      .map(topic => {
          throw new Error("STUB");
      })
      .reduce((acc, val) => { throw new Error("STUB"); }, []);

    // create the new assignment by populating the members with the first partition of the topics
    sortedMemberIds.forEach(assignee => {
        throw new Error("STUB");
    });

    // check for member topics that have a partition length of 0
    sortedMemberIds.forEach(assignee => {
        throw new Error("STUB");
    });

    // then balance out the rest of the topic partitions across the members
    const insertAssignmentsByTopic = (topicPartition, i) => {
        throw new Error("STUB");
    };

    // build the assignments
    topicsPartitions.forEach(insertAssignmentsByTopic);

    // encode the end result
    return Object.keys(assignment).map(memberId => { throw new Error("STUB"); });
  }

  public protocol(subscription: {
    topics: string[];
    userData: Buffer;
  }): GroupState {
      throw new Error("STUB");
  }

  public getPreviousAssignment() {
      throw new Error("STUB");
  }

  public decodeMember(member: GroupMember) {
    const memberMetadata = kafkaPackage.AssignerProtocol.MemberMetadata.decode(
      member.memberMetadata,
    ) as MemberMetadata;
    const memberUserData = JSON.parse(memberMetadata.userData.toString());

    return {
      memberId: member.memberId,
      previousAssignment: memberUserData.previousAssignment,
    };
  }
}
