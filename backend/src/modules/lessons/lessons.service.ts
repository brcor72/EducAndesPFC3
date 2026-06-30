import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { applyLangToLesson } from '../../common/utils/pick-lang';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  async findByCourse(courseId: string, lang = 'es') {
    const course = await this.prisma.course.findFirst({
      where: { OR: [{ id: courseId }, { slug: courseId }], deletedAt: null },
    });
    if (!course) throw new NotFoundException('Curso no encontrado');

    const lessons = await this.prisma.lesson.findMany({
      where: { courseId: course.id, deletedAt: null },
      orderBy: { index: 'asc' },
      include: { quizQuestions: { orderBy: { order: 'asc' } } },
    });

    return lessons.map((l) => applyLangToLesson(l, lang));
  }

  async findOne(courseId: string, lessonIndex: number, lang = 'es') {
    const course = await this.prisma.course.findFirst({
      where: { OR: [{ id: courseId }, { slug: courseId }], deletedAt: null },
    });
    if (!course) throw new NotFoundException('Curso no encontrado');

    const lesson = await this.prisma.lesson.findFirst({
      where: { courseId: course.id, index: lessonIndex, deletedAt: null },
      include: { quizQuestions: { orderBy: { order: 'asc' } } },
    });
    if (!lesson) throw new NotFoundException('Lección no encontrada');

    return applyLangToLesson(lesson, lang);
  }

  async submitQuiz(userId: string, questionId: string, selectedAnswer: number) {
    const question = await this.prisma.quizQuestion.findUnique({
      where: { id: questionId },
    });
    if (!question) throw new NotFoundException('Pregunta no encontrada');

    const isCorrect = question.answer === selectedAnswer;

    await this.prisma.quizSubmission.create({
      data: { userId, questionId, selectedAnswer, isCorrect },
    });

    return { isCorrect, correctAnswer: question.answer };
  }

  async getUserQuizResults(userId: string, lessonId: string) {
    return this.prisma.quizSubmission.findMany({
      where: { userId, question: { lessonId } },
      include: { question: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
